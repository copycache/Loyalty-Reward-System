<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblBranchAddCashierSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_branch', function (Blueprint $table) 
        {   
            $table->tinyInteger('add_member')->default(0);
            $table->tinyInteger('create_slot')->default(0);
            $table->tinyInteger('custom_code')->default(0);
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
