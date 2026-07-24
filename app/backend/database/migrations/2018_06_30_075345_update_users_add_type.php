<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateUsersAddType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) 
        {
            $table->string('type')->default('member');
        });

        Schema::table('tbl_admin', function (Blueprint $table) 
        {
            $table->integer('user_id')->nullable();
            $table->dropColumn('admin_username');
            $table->dropColumn('admin_password');
            $table->dropColumn('admin_first_name');
            $table->dropColumn('admin_middle_name');
            $table->dropColumn('admin_last_name');
            $table->dropColumn('admin_email');
            $table->dropColumn('archive');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
