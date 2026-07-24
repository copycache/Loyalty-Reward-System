<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMembership extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_membership', function (Blueprint $table) 
        {
            $table->increments('membership_id');
            $table->string('membership_name');
            $table->double('membership_price');
            $table->double('membership_gc')->default(0);
            $table->integer('membership_indirect_level')->default(0);
            $table->integer('membership_unilevel_level')->default(0);
            $table->dateTime('membership_date_created');
            $table->tinyInteger('membership_required_pv')->default(0);
            $table->tinyInteger('archive')->default(0);
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
