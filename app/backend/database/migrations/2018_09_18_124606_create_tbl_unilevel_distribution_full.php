<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblUnilevelDistributionFull extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('tbl_unilevel_distribute', 'distribute_full_id'))
        {
            Schema::table('tbl_unilevel_distribute', function (Blueprint $table) 
            {
                $table->integer('slot_id')->nullable();
                $table->integer('distribute_full_id')->nullable();
            }); 
        }

        if (!Schema::hasTable('tbl_unilevel_distribute_full'))
        { 
            Schema::create('tbl_unilevel_distribute_full', function (Blueprint $table) 
            {
                $table->increments('distribute_full_id');
                $table->dateTime('start_date');
                $table->dateTime('end_date');
                $table->dateTime('distribution_date');
            }); 
        }
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
